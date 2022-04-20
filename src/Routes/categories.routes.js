const CategoryController = require('../Controllers/CategoryController');
const { verifyJWT } = require('../Utils/functionsJWT');

const CategoriesRoutes = (routes) => {
  routes.get('/category', verifyJWT, CategoryController.categoryGet);
  routes.get('/category/:id', verifyJWT, CategoryController.categoryId);
  routes.get('/category_ativos', verifyJWT, CategoryController.categoryGetAtivos);
  routes.post('/category/create', verifyJWT, CategoryController.categoryCreate);
  routes.put('/category/update/:id', verifyJWT, CategoryController.categoryUpdate);
  routes.delete('/category/toggle/:id', verifyJWT, CategoryController.toggleCategory);
};

module.exports = { CategoriesRoutes };
