// app/api/admin-auth/route.js
export async function POST(request) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return Response.json({ 
        success: false, 
        error: 'Password is required' 
      }, { status: 400 })
    }

    // Password check di SERVER SIDE - AMAN!
    const isValid = password === process.env.ADMIN_PASSWORD

    console.log('Admin auth attempt:', { 
      received: password ? '***' : 'empty',
      expected: process.env.ADMIN_PASSWORD ? '***' : 'not set',
      isValid 
    })

    if (isValid) {
      return Response.json({ 
        success: true,
        message: 'Authentication successful'
      })
    } else {
      return Response.json({ 
        success: false, 
        error: 'Invalid password' 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
