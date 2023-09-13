const mongoose = require("mongoose");

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
});

const Contact = mongoose.model("Contact", contactSchema);

const listContacts = async () => {
  return await Contact.find().maxTimeMS(30000).lean().exec();
};

const getContactById = async (contactId) => {
  return await Contact.findById(contactId).maxTimeMS(30000).exec();
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
