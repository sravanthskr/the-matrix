export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers for development (includes HMAC signature headers)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization, X-Signature, X-Timestamp',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (path === '/') {
        return handleRoot(env);
      } else if (path.startsWith('/api/movies')) {
        return handleMovies(request, env, path);
      } else if (path.startsWith('/api/search')) {
        return handleSearch(request, env);
      } else if (path.startsWith('/api/stats')) {
        return handleStats(request, env);
      } else if (path.startsWith('/api/genres')) {
        return handleGenres(request, env);
      } else if (path.startsWith('/api/years')) {
        return handleYears(request, env);
      } else if (path.startsWith('/api/auth/')) {
        return handleUserAuth(request, env, path);
      } else if (path === '/api/verify-email' && method === 'POST') {
        return handleEmailVerification(request, env);
      } else if (path.startsWith('/auth/')) {
        return handleAuth(request, env, path);
      } else if (path === '/api/admin/auth' && method === 'POST') {
        return handleAdminAuth(request, env);
      } else if (path.startsWith('/admin/')) {
        return handleAdmin(request, env, path);
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }
  }
};

// Helper function to create response headers with rate limits
function createRateLimitHeaders(remaining, resetTime) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset',
    'X-Rate-Limit-Remaining': remaining?.toString() || '0',
    'X-Rate-Limit-Reset': resetTime || ''
  };
}

// API Root endpoint
async function handleRoot(env) {
  const movieCount = await env.DB.prepare('SELECT COUNT(*) as count FROM movies').first();
  
  return new Response(JSON.stringify({
    message: 'Movie Database API - Cloudflare Workers',
    version: '2.0',
    database: 'D1 SQLite',
    movie_count: movieCount?.count || 0,
    endpoints: {
      movies: '/api/movies',
      search: '/api/search',
      stats: '/api/stats',
      genres: '/api/genres',
      years: '/api/years'
    }
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    }
  });
}

// Movies endpoints with API key authentication
async function handleMovies(request, env, path) {
  const url = new URL(request.url);
  
  // Check API key for all public endpoints
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header. Visit our portal to get your API key.'
    }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }

  // Validate API key and check rate limits (with optional HMAC)
  const authCheck = await validateAPIKeyAndRateLimit(env, apiKey, path, request);
  if (!authCheck.allowed) {
    return new Response(JSON.stringify(authCheck.response), {
      status: authCheck.status,
      headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
    });
  }
  
  // GET /api/movies/{id}
  const movieIdMatch = path.match(/^\/api\/movies\/(\d+)$/);
  if (movieIdMatch) {
    const response = await getMovieById(env, parseInt(movieIdMatch[1]));
    // Add rate limit headers with expose
    response.headers.set('X-Rate-Limit-Remaining', authCheck.remaining.toString());
    response.headers.set('X-Rate-Limit-Reset', authCheck.resetTime);
    response.headers.set('Access-Control-Expose-Headers', 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset');
    return response;
  }
  
  // GET /api/movies (with pagination and filters)
  if (path === '/api/movies' && request.method === 'GET') {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const genre = url.searchParams.get('genre');
    const year = url.searchParams.get('year');
    const search = url.searchParams.get('search');
    
    const response = await getMovies(env, { page, limit, genre, year, search });
    // Add rate limit headers with expose
    response.headers.set('X-Rate-Limit-Remaining', authCheck.remaining.toString());
    response.headers.set('X-Rate-Limit-Reset', authCheck.resetTime);
    response.headers.set('Access-Control-Expose-Headers', 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset');
    return response;
  }

  return new Response('Method Not Allowed', { 
    status: 405,
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    }
  });
}

// Get all movies with filters and pagination
async function getMovies(env, { page, limit, genre, year, search }) {
  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let params = [];
  
  if (genre) {
    whereConditions.push('m.id IN (SELECT movie_id FROM movie_genres WHERE genre = ?)');
    params.push(genre);
  }
  
  if (year) {
    whereConditions.push('m.year = ?');
    params.push(parseInt(year));
  }
  
  if (search) {
    whereConditions.push('(m.title LIKE ? OR m.director LIKE ? OR m.plot LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
  
  // Get total count
  const countQuery = `SELECT COUNT(DISTINCT m.id) as count FROM movies m ${whereClause}`;
  const countResult = await env.DB.prepare(countQuery).bind(...params).first();
  const total = countResult.count;
  
  // Get movies with pagination
  const moviesQuery = `
    SELECT DISTINCT m.id, m.title, m.year, m.runtime, m.rating, m.director, m.plot, m.poster_url
    FROM movies m 
    ${whereClause}
    ORDER BY m.year DESC, m.title ASC
    LIMIT ? OFFSET ?
  `;
  
  const movies = await env.DB.prepare(moviesQuery)
    .bind(...params, limit, offset)
    .all();
  
  // Add genres and cast for each movie
  for (let movie of movies.results || []) {
    const genres = await env.DB.prepare('SELECT genre FROM movie_genres WHERE movie_id = ?')
      .bind(movie.id).all();
    const cast = await env.DB.prepare('SELECT actor_name, role FROM movie_cast WHERE movie_id = ?')
      .bind(movie.id).all();
    
    movie.genres = genres.results?.map(g => g.genre) || [];
    movie.cast = cast.results?.map(c => ({ name: c.actor_name, role: c.role })) || [];
  }
  
  return new Response(JSON.stringify({
    movies: movies.results || [],
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      has_next: page * limit < total,
      has_prev: page > 1
    }
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    }
  });
}

// Get single movie by ID
async function getMovieById(env, id) {
  const movie = await env.DB.prepare('SELECT * FROM movies WHERE id = ?').bind(id).first();
  
  if (!movie) {
    return new Response(JSON.stringify({ error: 'Movie not found' }), {
      status: 404,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
  
  // Get genres and cast
  const genres = await env.DB.prepare('SELECT genre FROM movie_genres WHERE movie_id = ?')
    .bind(id).all();
  const cast = await env.DB.prepare('SELECT actor_name, role FROM movie_cast WHERE movie_id = ?')
    .bind(id).all();
  
  movie.genres = genres.results?.map(g => g.genre) || [];
  movie.cast = cast.results?.map(c => ({ name: c.actor_name, role: c.role })) || [];
  
  return new Response(JSON.stringify(movie), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    }
  });
}

// Search endpoint with API key authentication
async function handleSearch(request, env) {
  const url = new URL(request.url);
  
  // Check API key
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header.'
    }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }

  // Validate API key and check rate limits (with optional HMAC)
  const authCheck = await validateAPIKeyAndRateLimit(env, apiKey, '/api/search', request);
  if (!authCheck.allowed) {
    return new Response(JSON.stringify(authCheck.response), {
      status: authCheck.status,
      headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
    });
  }
  
  const query = url.searchParams.get('q') || url.searchParams.get('title');
  const year = url.searchParams.get('year');
  const genre = url.searchParams.get('genre');
  
  if (!query && !year && !genre) {
    return new Response(JSON.stringify({ error: 'At least one search parameter required' }), {
      status: 400,
      headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
    });
  }
  
  const response = await getMovies(env, { page: 1, limit: 50, genre, year, search: query });
  response.headers.set('X-Rate-Limit-Remaining', authCheck.remaining.toString());
  response.headers.set('X-Rate-Limit-Reset', authCheck.resetTime);
  return response;
}

// Stats endpoint with API key authentication
async function handleStats(request, env) {
  // Check API key
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header.'
    }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }

  // Validate API key and check rate limits (with optional HMAC)
  const authCheck = await validateAPIKeyAndRateLimit(env, apiKey, '/api/stats', request);
  if (!authCheck.allowed) {
    return new Response(JSON.stringify(authCheck.response), {
      status: authCheck.status,
      headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
    });
  }
  
  const [moviesCount, genresCount, castCount, yearRange] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as count FROM movies').first(),
    env.DB.prepare('SELECT COUNT(*) as count FROM movie_genres').first(),
    env.DB.prepare('SELECT COUNT(*) as count FROM movie_cast').first(),
    env.DB.prepare('SELECT MIN(year) as min, MAX(year) as max FROM movies').first()
  ]);
  
  return new Response(JSON.stringify({
    movies_total: moviesCount.count,
    genres_total: genresCount.count,
    cast_total: castCount.count,
    year_range: {
      min: yearRange.min,
      max: yearRange.max
    }
  }), {
    headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
  });
}

// Genres endpoint with API key authentication
async function handleGenres(request, env) {
  // Check API key
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header.'
    }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }

  // Validate API key and check rate limits (with optional HMAC)
  const authCheck = await validateAPIKeyAndRateLimit(env, apiKey, '/api/genres', request);
  if (!authCheck.allowed) {
    return new Response(JSON.stringify(authCheck.response), {
      status: authCheck.status,
      headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
    });
  }
  
  const genres = await env.DB.prepare('SELECT DISTINCT genre FROM movie_genres ORDER BY genre').all();
  
  return new Response(JSON.stringify({
    genres: genres.results?.map(g => g.genre) || []
  }), {
    headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
  });
}

// Years endpoint with API key authentication
async function handleYears(request, env) {
  // Check API key
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header.'
    }), {
      status: 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }

  // Validate API key and check rate limits (with optional HMAC)
  const authCheck = await validateAPIKeyAndRateLimit(env, apiKey, '/api/years', request);
  if (!authCheck.allowed) {
    return new Response(JSON.stringify(authCheck.response), {
      status: authCheck.status,
      headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
    });
  }
  
  const years = await env.DB.prepare('SELECT DISTINCT year FROM movies ORDER BY year DESC').all();
  
  return new Response(JSON.stringify({
    years: years.results?.map(y => y.year) || []
  }), {
    headers: createRateLimitHeaders(authCheck.remaining, authCheck.resetTime)
  });
}

// ============================================================================
// UPDATED: User Authentication and API Key Management (WITH FIREBASE SUPPORT)
// ============================================================================
async function handleUserAuth(request, env, path) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
  };

  const method = request.method;
  
  try {
    // ========== NEW: FIREBASE AUTH ENDPOINTS ==========
    
    // POST /api/auth/login - User login and API key creation/retrieval
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await request.json();
      const { email, uid, idToken } = body;
      
      if (!email || !uid) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields',
          message: 'Email and UID are required' 
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      // Check if user already exists
      let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first();
      
      if (!user) {
        // Create new user
        const result = await env.DB.prepare(
          'INSERT INTO users (email, password_hash, is_verified) VALUES (?, ?, ?)'
        ).bind(email, uid, 1).run();
        
        const userId = result.meta.last_row_id;
        
        // Generate API key
        const apiKey = generateAPIKey();
        await env.DB.prepare(
          'INSERT INTO api_keys (user_id, api_key, is_active, daily_limit, monthly_limit) VALUES (?, ?, ?, ?, ?)'
        ).bind(userId, apiKey, 1, 100, 3000).run();
        
        return new Response(JSON.stringify({ 
          success: true,
          api_key: apiKey,
          message: 'Account created and API key generated'
        }), {
          status: 200,
          headers: corsHeaders
        });
      } else {
        // Update verification status
        await env.DB.prepare(
          'UPDATE users SET is_verified = 1 WHERE id = ?'
        ).bind(user.id).run();
        
        // Return existing API key or create new one
        const apiKeyRecord = await env.DB.prepare(
          'SELECT api_key FROM api_keys WHERE user_id = ? AND is_active = 1 LIMIT 1'
        ).bind(user.id).first();
        
        if (apiKeyRecord) {
          return new Response(JSON.stringify({ 
            success: true,
            api_key: apiKeyRecord.api_key
          }), {
            status: 200,
            headers: corsHeaders
          });
        } else {
          // Generate new API key if none exists
          const apiKey = generateAPIKey();
          await env.DB.prepare(
            'INSERT INTO api_keys (user_id, api_key, is_active, daily_limit, monthly_limit) VALUES (?, ?, ?, ?, ?)'
          ).bind(user.id, apiKey, 1, 1000, 10000).run();
          
          return new Response(JSON.stringify({ 
            success: true,
            api_key: apiKey
          }), {
            status: 200,
            headers: corsHeaders
          });
        }
      }
    }
    
    // POST /api/auth/get-api-key - Get API key for verified user
    if (path === '/api/auth/get-api-key' && method === 'POST') {
      const body = await request.json();
      const { email, uid } = body;
      
      if (!email) {
        return new Response(JSON.stringify({ 
          error: 'Email is required' 
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first();
      
      if (!user) {
        return new Response(JSON.stringify({ 
          error: 'User not found',
          message: 'Please login first to create your account' 
        }), {
          status: 404,
          headers: corsHeaders
        });
      }
      
      const apiKeyRecord = await env.DB.prepare(
        'SELECT api_key FROM api_keys WHERE user_id = ? AND is_active = 1 LIMIT 1'
      ).bind(user.id).first();
      
      if (apiKeyRecord) {
        return new Response(JSON.stringify({ 
          api_key: apiKeyRecord.api_key
        }), {
          status: 200,
          headers: corsHeaders
        });
      } else {
        // Generate API key if none exists
        const apiKey = generateAPIKey();
        await env.DB.prepare(
          'INSERT INTO api_keys (user_id, api_key, is_active, daily_limit, monthly_limit) VALUES (?, ?, ?, ?, ?)'
        ).bind(user.id, apiKey, 1, 1000, 10000).run();
        
        return new Response(JSON.stringify({ 
          api_key: apiKey
        }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }
    
    // ========== EXISTING ENDPOINTS (KEPT AS-IS) ==========
    
    // GET /api/auth/dashboard/{userId} - Get user dashboard data
    const dashboardMatch = path.match(/^\/api\/auth\/dashboard\/(\d+)$/);
    if (dashboardMatch && method === 'GET') {
      const userId = parseInt(dashboardMatch[1]);
      return getUserDashboard(env, userId);
    }

    // POST /api/auth/api-key/{userId} - Create new API key
    const createKeyMatch = path.match(/^\/api\/auth\/api-key\/(\d+)$/);
    if (createKeyMatch && method === 'POST') {
      const userId = parseInt(createKeyMatch[1]);
      return createUserApiKey(env, userId);
    }

    // DELETE /api/auth/api-key/{userId}/{keyId} - Delete API key
    const deleteKeyMatch = path.match(/^\/api\/auth\/api-key\/(\d+)\/(\d+)$/);
    if (deleteKeyMatch && method === 'DELETE') {
      const userId = parseInt(deleteKeyMatch[1]);
      const keyId = parseInt(deleteKeyMatch[2]);
      return deleteUserApiKey(env, userId, keyId);
    }

    return new Response(JSON.stringify({ 
      error: 'User auth endpoint not found',
      path: path
    }), {
      status: 404,
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('User auth error:', error);
    return new Response(JSON.stringify({
      error: 'User authentication service error',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// ============================================================================
// NEW: Helper function to generate random API key
// ============================================================================
function generateAPIKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = 'mk_';
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return apiKey;
}

// Get user dashboard data including stats and API keys
async function getUserDashboard(env, userId) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
  };

  try {
    // Get user API keys
    const apiKeys = await env.DB.prepare(`
      SELECT id, api_key, created_at, is_active
      FROM api_keys 
      WHERE user_id = ? AND is_active = 1
      ORDER BY created_at DESC
    `).bind(userId).all();

    // Get usage stats for the user's API keys
    let totalRequests = 0;
    let thisMonthRequests = 0;
    
    if (apiKeys.results && apiKeys.results.length > 0) {
      const keyIds = apiKeys.results.map(key => key.id);
      const keyPlaceholders = keyIds.map(() => '?').join(',');
      
      // Get total requests (exclude cleanup markers)
      const totalResult = await env.DB.prepare(`
        SELECT COUNT(*) as total 
        FROM usage_logs 
        WHERE api_key_id IN (${keyPlaceholders}) AND endpoint != '__cleanup__'
      `).bind(...keyIds).first();
      
      totalRequests = totalResult?.total || 0;

      // Get this month's requests (exclude cleanup markers)
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
      const monthResult = await env.DB.prepare(`
        SELECT COUNT(*) as total 
        FROM usage_logs 
        WHERE api_key_id IN (${keyPlaceholders}) 
        AND DATE(timestamp) LIKE ? AND endpoint != '__cleanup__'
      `).bind(...keyIds, `${currentMonth}%`).first();
      
      thisMonthRequests = monthResult?.total || 0;
    }

    // Get real hourly chart data from usage logs
    const chartData = [];
    const today = new Date().toISOString().split('T')[0];
    
    if (apiKeys.results && apiKeys.results.length > 0) {
      const keyIds = apiKeys.results.map(key => key.id);
      const keyPlaceholders = keyIds.map(() => '?').join(',');
      
      // Get hourly usage for today
      for (let i = 0; i < 24; i++) {
        const hourStart = `${today} ${String(i).padStart(2, '0')}:00:00`;
        const hourEnd = `${today} ${String(i).padStart(2, '0')}:59:59`;
        
        const hourlyCount = await env.DB.prepare(`
          SELECT COUNT(*) as count 
          FROM usage_logs 
          WHERE api_key_id IN (${keyPlaceholders}) 
          AND timestamp BETWEEN ? AND ? AND endpoint != '__cleanup__'
        `).bind(...keyIds, hourStart, hourEnd).first();
        
        chartData.push({
          hour: i,
          requests: hourlyCount?.count || 0
        });
      }
    } else {
      // No API keys, return empty chart
      for (let i = 0; i < 24; i++) {
        chartData.push({ hour: i, requests: 0 });
      }
    }

    // Get today's real usage count
    let dailyUsage = 0;
    
    if (apiKeys.results && apiKeys.results.length > 0) {
      const keyIds = apiKeys.results.map(key => key.id);
      const keyPlaceholders = keyIds.map(() => '?').join(',');
      
      const todayResult = await env.DB.prepare(`
        SELECT SUM(request_count) as total 
        FROM daily_usage 
        WHERE api_key_id IN (${keyPlaceholders}) AND date = ?
      `).bind(...keyIds, today).first();
      
      dailyUsage = todayResult?.total || 0;
    }

    const dashboardData = {
      stats: {
        total_requests: totalRequests,
        this_month_requests: thisMonthRequests,
        api_key_count: apiKeys.results?.length || 0,
        daily_usage: dailyUsage,
        daily_limit: 100,
        plan: 'free',
        chart_data: chartData
      },
      api_keys: apiKeys.results || []
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to load dashboard data',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Create new API key for user (requires email verification)
async function createUserApiKey(env, userId) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
  };

  try {
    // Check if user is verified
    const user = await env.DB.prepare(
      'SELECT is_verified FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!user) {
      return new Response(JSON.stringify({
        error: 'User not found',
        message: 'User account does not exist'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    if (!user.is_verified) {
      return new Response(JSON.stringify({
        error: 'Email not verified',
        message: 'Please verify your email address before creating API keys. Check your inbox for the verification link.'
      }), {
        status: 403,
        headers: corsHeaders
      });
    }
    
    // Generate new API key with 100 requests/day limit (free plan)
    const apiKey = 'mk_live_' + crypto.randomUUID().replace(/-/g, '');
    
    // Insert into database with free plan limit (100 requests/day)
    const result = await env.DB.prepare(`
      INSERT INTO api_keys (user_id, api_key, is_active, daily_limit, created_at)
      VALUES (?, ?, 1, 100, datetime('now'))
    `).bind(userId, apiKey).run();

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'API key created successfully',
        api_key: apiKey,
        id: result.meta.last_row_id
      }), {
        headers: corsHeaders
      });
    } else {
      throw new Error('Failed to create API key');
    }

  } catch (error) {
    console.error('Create API key error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create API key',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Delete user API key
async function deleteUserApiKey(env, userId, keyId) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
  };

  try {
    // Soft delete - set is_active to 0
    const result = await env.DB.prepare(`
      UPDATE api_keys 
      SET is_active = 0 
      WHERE id = ? AND user_id = ?
    `).bind(keyId, userId).run();

    if (result.changes > 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'API key deleted successfully'
      }), {
        headers: corsHeaders
      });
    } else {
      return new Response(JSON.stringify({
        error: 'API key not found'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

  } catch (error) {
    console.error('Delete API key error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to delete API key',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Auth endpoints (placeholder for Firebase integration)
async function handleAuth(request, env, path) {
  return new Response(JSON.stringify({ 
    message: 'Authentication endpoints - Firebase integration pending',
    path: path
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    }
  });
}

// Admin endpoints with full CRUD operations
async function handleAdmin(request, env, path) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
  };

  // Check admin authentication using D1-persisted sessions
  const isAuthorized = await validateAdminKey(request, env);
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  const method = request.method;
  const url = new URL(request.url);

  // GET /admin/movies - List all movies for admin
  if (path === '/admin/movies' && method === 'GET') {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const search = url.searchParams.get('search') || '';
    return getMoviesAdmin(env, { page, limit, search });
  }

  // POST /admin/movies - Create new movie
  if (path === '/admin/movies' && method === 'POST') {
    return createMovie(request, env);
  }

  // GET /admin/movies/{id} - Get specific movie for editing
  const movieIdMatch = path.match(/^\/admin\/movies\/(\d+)$/);
  if (movieIdMatch && method === 'GET') {
    return getMovieById(env, parseInt(movieIdMatch[1]));
  }

  // PUT /admin/movies/{id} - Update movie
  if (movieIdMatch && method === 'PUT') {
    return updateMovie(request, env, parseInt(movieIdMatch[1]));
  }

  // DELETE /admin/movies/{id} - Delete movie
  if (movieIdMatch && method === 'DELETE') {
    return deleteMovie(env, parseInt(movieIdMatch[1]));
  }

  // POST /admin/movies/bulk-delete - Bulk delete movies
  if (path === '/admin/movies/bulk-delete' && method === 'POST') {
    return bulkDeleteMovies(request, env);
  }

  // POST /admin/movies/import-csv - Import CSV data
  if (path === '/admin/movies/import-csv' && method === 'POST') {
    return importCSVMovies(request, env);
  }

  // POST /admin/movies/upload-poster - Upload poster image to Cloudinary
  if (path === '/admin/movies/upload-poster' && method === 'POST') {
    return uploadPosterImage(request, env);
  }

  // POST /admin/movies/{id}/update-poster - Update movie poster
  const posterUpdateMatch = path.match(/^\/admin\/movies\/(\d+)\/update-poster$/);
  if (posterUpdateMatch && method === 'POST') {
    return updateMoviePoster(request, env, parseInt(posterUpdateMatch[1]));
  }

  return new Response(JSON.stringify({ error: 'Admin endpoint not found' }), {
    status: 404,
    headers: corsHeaders
  });
}

// Get movies for admin (no limits, full access)
async function getMoviesAdmin(env, { page, limit, search = '' }) {
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  let params = [];
  
  if (search) {
    whereClause = 'WHERE m.title LIKE ? OR m.director LIKE ? OR m.plot LIKE ?';
    const searchTerm = `%${search}%`;
    params = [searchTerm, searchTerm, searchTerm];
  }
  
  const movies = await env.DB.prepare(`
    SELECT m.*, 
           GROUP_CONCAT(DISTINCT g.genre) as genres,
           GROUP_CONCAT(DISTINCT c.actor_name) as cast
    FROM movies m
    LEFT JOIN movie_genres g ON m.id = g.movie_id
    LEFT JOIN movie_cast c ON m.id = c.movie_id
    ${whereClause}
    GROUP BY m.id
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  const countQuery = search 
    ? 'SELECT COUNT(*) as count FROM movies WHERE title LIKE ? OR director LIKE ? OR plot LIKE ?'
    : 'SELECT COUNT(*) as count FROM movies';
  
  const total = search
    ? await env.DB.prepare(countQuery).bind(...params).first()
    : await env.DB.prepare(countQuery).first();

  return new Response(JSON.stringify({
    movies: movies.results?.map(movie => ({
      ...movie,
      genres: movie.genres || '',
      cast: movie.cast || ''
    })) || [],
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit)
    }
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    }
  });
}

// Create new movie
async function createMovie(request, env) {
  try {
    const movieData = await request.json();
    const { title, year, runtime, rating, director, plot, poster_url, genres, cast } = movieData;

    // Validate required fields
    if (!title || !year) {
      return new Response(JSON.stringify({ error: 'Title and year are required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
        }
      });
    }

    // Insert movie
    const result = await env.DB.prepare(`
      INSERT INTO movies (title, year, runtime, rating, director, plot, poster_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(title, year || 0, runtime || 0, rating || 0, director || '', plot || '', poster_url || '').run();

    const movieId = result.meta.last_row_id;

    // Insert genres
    if (genres) {
      const genreList = genres.split('|').filter(g => g.trim());
      for (const genre of genreList) {
        await env.DB.prepare('INSERT OR IGNORE INTO movie_genres (movie_id, genre) VALUES (?, ?)')
          .bind(movieId, genre.trim()).run();
      }
    }

    // Insert cast
    if (cast) {
      const castList = cast.split('|').filter(c => c.trim());
      for (const actor of castList) {
        await env.DB.prepare('INSERT OR IGNORE INTO movie_cast (movie_id, actor_name) VALUES (?, ?)')
          .bind(movieId, actor.trim()).run();
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      id: movieId,
      message: 'Movie created successfully' 
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create movie: ' + error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
}

// Update movie
async function updateMovie(request, env, movieId) {
  try {
    const movieData = await request.json();
    const { title, year, runtime, rating, director, plot, poster_url, genres, cast } = movieData;

    // Update movie
    await env.DB.prepare(`
      UPDATE movies 
      SET title = ?, year = ?, runtime = ?, rating = ?, director = ?, plot = ?, poster_url = ?
      WHERE id = ?
    `).bind(title, year, runtime || 0, rating || 0, director || '', plot || '', poster_url || '', movieId).run();

    // Delete existing genres and cast
    await env.DB.prepare('DELETE FROM movie_genres WHERE movie_id = ?').bind(movieId).run();
    await env.DB.prepare('DELETE FROM movie_cast WHERE movie_id = ?').bind(movieId).run();

    // Insert new genres
    if (genres) {
      const genreList = genres.split('|').filter(g => g.trim());
      for (const genre of genreList) {
        await env.DB.prepare('INSERT INTO movie_genres (movie_id, genre) VALUES (?, ?)')
          .bind(movieId, genre.trim()).run();
      }
    }

    // Insert new cast
    if (cast) {
      const castList = cast.split('|').filter(c => c.trim());
      for (const actor of castList) {
        await env.DB.prepare('INSERT INTO movie_cast (movie_id, actor_name) VALUES (?, ?)')
          .bind(movieId, actor.trim()).run();
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Movie updated successfully' 
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update movie: ' + error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
}

// Delete movie
async function deleteMovie(env, movieId) {
  try {
    // Delete related data first (foreign key constraints)
    await env.DB.prepare('DELETE FROM movie_genres WHERE movie_id = ?').bind(movieId).run();
    await env.DB.prepare('DELETE FROM movie_cast WHERE movie_id = ?').bind(movieId).run();
    
    // Delete movie
    const result = await env.DB.prepare('DELETE FROM movies WHERE id = ?').bind(movieId).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Movie not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Movie deleted successfully' 
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete movie: ' + error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
}

// Bulk delete movies
async function bulkDeleteMovies(request, env) {
  try {
    const { movieIds } = await request.json();
    
    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Movie IDs array required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
        }
      });
    }

    let deletedCount = 0;
    for (const movieId of movieIds) {
      // Delete related data
      await env.DB.prepare('DELETE FROM movie_genres WHERE movie_id = ?').bind(movieId).run();
      await env.DB.prepare('DELETE FROM movie_cast WHERE movie_id = ?').bind(movieId).run();
      
      // Delete movie
      const result = await env.DB.prepare('DELETE FROM movies WHERE id = ?').bind(movieId).run();
      if (result.changes > 0) deletedCount++;
    }

    return new Response(JSON.stringify({ 
      success: true,
      deleted_count: deletedCount,
      message: `${deletedCount} movies deleted successfully` 
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete movies: ' + error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
}

// Import CSV movies
async function importCSVMovies(request, env) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('csv');
    
    if (!csvFile) {
      return new Response(JSON.stringify({ error: 'CSV file required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
        }
      });
    }

    const csvText = await csvFile.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    let added = 0, updated = 0, errors = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const movieData = {};
        headers.forEach((header, index) => {
          movieData[header] = values[index] || '';
        });

        // Check if movie exists
        const existing = await env.DB.prepare('SELECT id FROM movies WHERE title = ? AND year = ?')
          .bind(movieData.title, parseInt(movieData.year)).first();

        if (existing) {
          // Update existing movie
          await updateMovieFromCSV(env, existing.id, movieData);
          updated++;
        } else {
          // Create new movie
          await createMovieFromCSV(env, movieData);
          added++;
        }
      } catch (error) {
        console.error('Error processing line:', error);
        errors++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      added,
      updated,
      errors,
      message: `Import completed: ${added} added, ${updated} updated, ${errors} errors` 
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to import CSV: ' + error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
}

// Helper function to parse CSV line properly
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i-1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Helper function to create movie from CSV data
async function createMovieFromCSV(env, movieData) {
  const result = await env.DB.prepare(`
    INSERT INTO movies (title, year, runtime, rating, director, plot, poster_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    movieData.title,
    parseInt(movieData.year) || new Date().getFullYear(),
    parseInt(movieData.runtime) || 120, // Default to 120 minutes if not provided
    parseFloat(movieData.rating) || 0,
    movieData.director || '',
    movieData.plot || '',
    movieData.poster_url || ''
  ).run();

  const movieId = result.meta.last_row_id;

  // Add genres
  if (movieData.genre || movieData.genres) {
    const genres = (movieData.genre || movieData.genres).split('|').filter(g => g.trim());
    for (const genre of genres) {
      await env.DB.prepare('INSERT OR IGNORE INTO movie_genres (movie_id, genre) VALUES (?, ?)')
        .bind(movieId, genre.trim()).run();
    }
  }

  // Add cast
  if (movieData.actors || movieData.cast) {
    const actors = (movieData.actors || movieData.cast).split('|').filter(a => a.trim());
    for (const actor of actors) {
      await env.DB.prepare('INSERT OR IGNORE INTO movie_cast (movie_id, actor_name) VALUES (?, ?)')
        .bind(movieId, actor.trim()).run();
    }
  }
}

// Helper function to update movie from CSV data
async function updateMovieFromCSV(env, movieId, movieData) {
  await env.DB.prepare(`
    UPDATE movies 
    SET title = ?, year = ?, runtime = ?, rating = ?, director = ?, plot = ?, poster_url = ?
    WHERE id = ?
  `).bind(
    movieData.title,
    parseInt(movieData.year) || new Date().getFullYear(),
    parseInt(movieData.runtime) || 120, // Default to 120 minutes if not provided
    parseFloat(movieData.rating) || 0,
    movieData.director || '',
    movieData.plot || '',
    movieData.poster_url || '',
    movieId
  ).run();

  // Update genres and cast
  await env.DB.prepare('DELETE FROM movie_genres WHERE movie_id = ?').bind(movieId).run();
  await env.DB.prepare('DELETE FROM movie_cast WHERE movie_id = ?').bind(movieId).run();

  // Add new genres
  if (movieData.genre || movieData.genres) {
    const genres = (movieData.genre || movieData.genres).split('|').filter(g => g.trim());
    for (const genre of genres) {
      await env.DB.prepare('INSERT INTO movie_genres (movie_id, genre) VALUES (?, ?)')
        .bind(movieId, genre.trim()).run();
    }
  }

  // Add new cast
  if (movieData.actors || movieData.cast) {
    const actors = (movieData.actors || movieData.cast).split('|').filter(a => a.trim());
    for (const actor of actors) {
      await env.DB.prepare('INSERT INTO movie_cast (movie_id, actor_name) VALUES (?, ?)')
        .bind(movieId, actor.trim()).run();
    }
  }
}

// HMAC signature verification for enhanced security
async function verifyHMACSignature(request, apiKey, endpoint) {
  const signature = request.headers.get('X-Signature');
  const timestamp = request.headers.get('X-Timestamp');
  
  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing HMAC signature or timestamp' };
  }
  
  // Prevent replay attacks (5 minute window)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 300000) {
    return { valid: false, error: 'Request timestamp expired' };
  }
  
  // Create signature string: timestamp + method + path + body
  const method = request.method;
  const path = new URL(request.url).pathname;
  let body = '';
  
  if (request.method !== 'GET') {
    body = await request.text();
  }
  
  const signatureString = `${timestamp}${method}${path}${body}`;
  
  // Compute HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKey);
  const msgData = encoder.encode(signatureString);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid signature' };
  }
  
  return { valid: true };
}

// API Key Authentication and Rate Limiting Functions
async function validateAPIKeyAndRateLimit(env, apiKey, endpoint, request = null) {
  // Check if API key exists and is active
  try {
    const keyData = await env.DB.prepare(
      'SELECT id, user_id, daily_limit, is_active FROM api_keys WHERE api_key = ? AND is_active = 1'
    ).bind(apiKey).first();

    if (!keyData) {
      return {
        allowed: false,
        status: 401,
        response: {
          error: 'Invalid API key',
          message: 'The provided API key is invalid or has been deactivated. Please check your key or contact support.'
        }
      };
    }
    
    // Optional HMAC verification (if signature headers present)
    if (request && request.headers.get('X-Signature')) {
      const hmacResult = await verifyHMACSignature(request, apiKey, endpoint);
      if (!hmacResult.valid) {
        return {
          allowed: false,
          status: 401,
          response: {
            error: 'HMAC verification failed',
            message: hmacResult.error
          }
        };
      }
    }

    // Check daily rate limit (100 requests/day for free plan)
    const today = new Date().toISOString().split('T')[0];
    const usage = await env.DB.prepare(
      'SELECT request_count FROM daily_usage WHERE api_key_id = ? AND date = ?'
    ).bind(keyData.id, today).first();

    const currentCount = usage?.request_count || 0;
    const dailyLimit = 100; // Free plan: 100 requests per day per user

    if (currentCount >= dailyLimit) {
      const resetTime = new Date();
      resetTime.setUTCDate(resetTime.getUTCDate() + 1);
      resetTime.setUTCHours(0, 0, 0, 0);

      return {
        allowed: false,
        status: 429,
        remaining: 0,
        resetTime: resetTime.toISOString(),
        response: {
          error: 'Rate limit exceeded',
          message: `Daily limit of ${dailyLimit} requests exceeded. Limit resets at midnight UTC.`,
          requests_remaining: 0,
          daily_limit: dailyLimit,
          reset_time: resetTime.toISOString()
        }
      };
    }

    // Update usage count
    await env.DB.prepare(`
      INSERT INTO daily_usage (api_key_id, date, request_count) 
      VALUES (?, ?, 1)
      ON CONFLICT(api_key_id, date) 
      DO UPDATE SET request_count = request_count + 1
    `).bind(keyData.id, today).run();

    // Log API usage
    await env.DB.prepare(
      'INSERT INTO usage_logs (api_key_id, endpoint, status_code) VALUES (?, ?, ?)'
    ).bind(keyData.id, endpoint, 200).run();

    // Intelligent log cleanup: Run once per day per API key to avoid per-request overhead
    const lastCleanup = await env.DB.prepare(
      'SELECT MAX(timestamp) as last_cleanup FROM usage_logs WHERE api_key_id = ? AND endpoint = \'__cleanup__\''
    ).bind(keyData.id).first();
    
    const shouldCleanup = !lastCleanup?.last_cleanup || 
      (Date.now() - new Date(lastCleanup.last_cleanup).getTime() > 86400000); // 24 hours
    
    if (shouldCleanup) {
      // Delete logs older than 90 days
      const cleanupDate = new Date();
      cleanupDate.setDate(cleanupDate.getDate() - 90);
      const cleanupDateStr = cleanupDate.toISOString().split('T')[0];
      
      await env.DB.prepare(
        'DELETE FROM usage_logs WHERE DATE(timestamp) < ?'
      ).bind(cleanupDateStr).run();
      
      // Mark cleanup as done for this key
      await env.DB.prepare(
        'INSERT INTO usage_logs (api_key_id, endpoint, status_code) VALUES (?, ?, ?)'
      ).bind(keyData.id, '__cleanup__', 200).run();
    }

    const resetTime = new Date();
    resetTime.setUTCDate(resetTime.getUTCDate() + 1);
    resetTime.setUTCHours(0, 0, 0, 0);

    return {
      allowed: true,
      remaining: dailyLimit - currentCount - 1,
      resetTime: resetTime.toISOString(),
      apiKeyId: keyData.id
    };

  } catch (error) {
    console.error('API key validation error:', error);
    return {
      allowed: false,
      status: 500,
      response: {
        error: 'Authentication service temporarily unavailable',
        message: 'Please try again in a moment.'
      }
    };
  }
}

// Admin authentication function with multiple validation methods using D1 for session persistence
async function validateAdminKey(request, env) {
  const validAdminKey = env.ADMIN_API_KEY || 'mk_fnPJ0EJnnHlN4ny69LjBKnH85sz_DfbjxvG85v9sr_s';
  
  // Method 1: Check X-Admin-Key header (backward compatible)
  const xAdminKey = request.headers.get('X-Admin-Key');
  if (xAdminKey && xAdminKey === validAdminKey) {
    return true;
  }
  
  // Method 2: Check Authorization Bearer header (session token or admin key)
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Check if it's a valid session token in D1
    try {
      const session = await env.DB.prepare(
        'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > datetime("now")'
      ).bind(token).first();
      
      if (session) {
        return true;
      }
    } catch (error) {
      console.error('Session validation error:', error);
    }
    
    // Check if it's the admin API key itself
    if (token === validAdminKey) {
      return true;
    }
  }
  
  return false;
}

// Cloudinary integration functions
async function uploadPosterImage(request, env) {
  try {
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    };

    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile || !imageFile.size) {
      return new Response(JSON.stringify({ 
        error: 'No image file provided',
        message: 'Please select an image file to upload'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file type',
        message: 'Only image files are allowed'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Convert to base64 for Cloudinary upload
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', `data:${imageFile.type};base64,${base64String}`);
    cloudinaryFormData.append('api_key', env.CLOUDINARY_API_KEY);
    cloudinaryFormData.append('folder', 'movie-posters');
    cloudinaryFormData.append('transformation', 'c_fill,w_500,h_750'); // Optimize for movie posters
    
    // Generate signature for secure upload
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `folder=movie-posters&timestamp=${timestamp}&transformation=c_fill,w_500,h_750${env.CLOUDINARY_API_SECRET}`;
    const signature = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(stringToSign));
    const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signatureHex);

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cloudinary upload error:', error);
      return new Response(JSON.stringify({ 
        error: 'Image upload failed',
        message: 'Failed to upload image to storage service'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Image uploaded successfully',
      image_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Upload poster error:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      message: 'An error occurred while uploading the image'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
}

// Update movie poster URL in database
async function updateMoviePoster(request, env, movieId) {
  try {
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
    };

    const { poster_url } = await request.json();
    
    if (!poster_url) {
      return new Response(JSON.stringify({ 
        error: 'No poster URL provided',
        message: 'Please provide a valid poster URL'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Update movie poster URL in database
    const result = await env.DB.prepare(
      'UPDATE movies SET poster_url = ? WHERE id = ?'
    ).bind(poster_url, movieId).run();

    if (!result.success || result.changes === 0) {
      return new Response(JSON.stringify({ 
        error: 'Movie not found',
        message: 'Could not update poster for the specified movie'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Get updated movie data
    const movie = await env.DB.prepare('SELECT * FROM movies WHERE id = ?').bind(movieId).first();

    return new Response(JSON.stringify({
      success: true,
      message: 'Movie poster updated successfully',
      movie: movie
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Update poster error:', error);
    return new Response(JSON.stringify({ 
      error: 'Update failed',
      message: 'An error occurred while updating the movie poster'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
      }
    });
  }
}

// Email Verification Handler (Firebase integration)
async function handleEmailVerification(request, env) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'X-Rate-Limit-Remaining, X-Rate-Limit-Reset'
  };

  try {
    const { email, uid, emailVerified } = await request.json();

    if (!email || !uid) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        message: 'Email and UID are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Check if user exists
    let user = await env.DB.prepare(
      'SELECT id, is_verified FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      // Create new user if doesn't exist
      const result = await env.DB.prepare(`
        INSERT INTO users (email, password_hash, is_verified)
        VALUES (?, ?, ?)
      `).bind(email, 'firebase_auth_' + uid, emailVerified ? 1 : 0).run();
      
      user = { id: result.meta.last_row_id, is_verified: emailVerified ? 1 : 0 };
    } else if (emailVerified && !user.is_verified) {
      // Update verification status
      await env.DB.prepare(
        'UPDATE users SET is_verified = 1 WHERE email = ?'
      ).bind(email).run();
      
      user.is_verified = 1;
    }

    return new Response(JSON.stringify({
      success: true,
      message: emailVerified ? 'Email verified successfully' : 'User registered, please verify email',
      user_id: user.id,
      is_verified: Boolean(user.is_verified),
      can_create_api_keys: Boolean(user.is_verified)
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return new Response(JSON.stringify({
      error: 'Verification failed',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Secure Admin Authentication Handler
async function handleAdminAuth(request, env) {
  try {
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "X-Rate-Limit-Remaining, X-Rate-Limit-Reset"
    };

    const { adminKey } = await request.json();

    if (!adminKey) {
      return new Response(JSON.stringify({
        success: false,
        message: "Admin key required"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate against environment variable admin key only (secure)
    const validAdminKey = env.ADMIN_API_KEY;
    
    if (!validAdminKey || adminKey !== validAdminKey) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid admin credentials. Please use the correct admin API key."
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();
    
    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const expiresAtStr = expiresAt.toISOString().replace('T', ' ').substring(0, 19);
    
    // Store session token in D1 database for persistence across worker isolates
    await env.DB.prepare(
      'INSERT INTO admin_sessions (session_token, admin_key, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionToken, validAdminKey, expiresAtStr).run();
    
    // Clean up expired sessions (run occasionally, not on every request)
    await env.DB.prepare(
      'DELETE FROM admin_sessions WHERE expires_at < datetime("now")'
    ).run();
    
    // Get admin info from environment or use defaults
    const uid = env.ADMIN_UID || "admin_user";
    const email = env.ADMIN_EMAIL || "admin@moviedb.com";
    
    return new Response(JSON.stringify({
      success: true,
      message: "Authentication successful",
      uid: uid,
      email: email,
      sessionToken: sessionToken
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error("Admin auth error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Authentication service error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "X-Rate-Limit-Remaining, X-Rate-Limit-Reset"
      }
    });
  }
}