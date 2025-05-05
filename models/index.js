const usersModel = require("./nosql/users");
const clientsModel = require("./nosql/client");
const projectsModel = require("./nosql/project");
const deliveryNotesModel = require("./nosql/deliverynote");

module.exports = {
  usersModel,
  clientsModel,
  projectsModel,
  deliveryNotesModel
};
