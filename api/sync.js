const sequelize = require('./models').sequelize;

// sync the database to drop and recreate tables for fresh development
sequelize
  .sync({ force: true })
  .then(() => {
    console.log('Database & tables created!');
    process.exit();
  })
  .catch((error) => {
    console.error('Error syncing the database:', error);
    process.exit(1);
  });
