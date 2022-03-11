const CategoryController = require('../Controllers/CategoryController');
const { verifyJWT } = require('../Utils/functionsJWT');

const CategoriesRoutes = (routes) => {
  routes.get('/category', verifyJWT, CategoryController.categoryGet);
  routes.get('/category/:id', verifyJWT, CategoryController.categoryId);
  routes.post('/category/create', verifyJWT, CategoryController.categoryCreate);
  routes.put('/category/update/:id', verifyJWT, CategoryController.categoryUpdate);
  routes.delete('/category/delete/:id', verifyJWT, CategoryController.categoryDelete);
};

module.exports = { CategoriesRoutes };
