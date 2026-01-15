import { Router } from 'express';

var apiv2 = Router();

apiv2.get('/', function(req, res) {
  res.send('Hello from APIv2 root route.');
});

apiv2.get('/users', function(req, res) {
  res.json({"foo": "bar"});
});

export default apiv2;