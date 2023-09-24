const mongoose = require("mongoose");

// schema for contact in phonebook
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Contact = mongoose.model("contacts", contactSchema);

// add pagination
const listContacts = async (page, limit) => {
  return await Contact.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
};

// const listContacts = async () => {
//   return await Contact.find().exec();
// };

const getContactById = async (contactId) => {
  return await Contact.findById({ _id: contactId }).exec();
};

const removeContact = async (contactId) => {
  return await Contact.findByIdAndRemove(contactId).exec();
};

const addContact = async (contact) => {
  return await Contact.create(contact);
};

const updateContact = async (contactId, data) => {
  return await Contact.findByIdAndUpdate(contactId, data, { new: true }).exec();
};

const updateStatusContact = async (contactId, data) => {
  return await Contact.findByIdAndUpdate(
    contactId,
    { favorite: data.favorite },
    { new: true }
  ).exec();
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
