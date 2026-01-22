import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard/index', {
    user: req.session.user
  });
});

export default router;
