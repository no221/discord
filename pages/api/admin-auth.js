// pages/api/admin-auth.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { password } = req.body
      
      if (!password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Password is required' 
        })
      }

      // Password check di SERVER SIDE - AMAN!
      const isValid = password === process.env.ADMIN_PASSWORD

      console.log('Admin auth attempt:', { 
        received: password ? '***' : 'empty',
        expected: process.env.ADMIN_PASSWORD ? '***' : 'not set',
        isValid 
      })

      if (isValid) {
        return res.status(200).json({ 
          success: true,
          message: 'Authentication successful'
        })
      } else {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid password' 
        })
      }
    } catch (error) {
      console.error('Admin auth error:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
