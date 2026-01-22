import { Router } from 'express';
import bcrypt from 'bcrypt';

const router = Router();

// fake user (remplace par Prisma)
const userDB = {
  id: '1',
  email: 'admin@test.com',
  password: bcrypt.hashSync('123456', 10),
  role: 'ADMIN' // or 'USER'
};

router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email !== userDB.email) {
    return res.render('auth/login', { error: 'User not found' });
  }

  const valid = await bcrypt.compare(password, userDB.password);

  if (!valid) {
    return res.render('auth/login', { error: 'Invalid password' });
  }

  req.session.user = {
    id: userDB.id,
    email: userDB.email,
    role: userDB.role
  };

  res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

export default router;
// End of file: controllers/auth.routes.ts