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

// const fs = require("fs/promises");
// const path = require("path");
// const { nanoid } = require("nanoid");

// const contactsFilePath = path.join(__dirname, "contacts.json");

// const listContacts = async () => {
//   const data = await fs.readFile(contactsFilePath);
//   return JSON.parse(data);
// };

// const getContactById = async (contactId) => {
//   const contacts = await listContacts();
//   return contacts.find((contact) => contact.id === contactId);
// };

// const removeContact = async (contactId) => {
//   const contacts = await listContacts();
//   const updatedContacts = contacts.filter(
//     (contact) => contact.id !== contactId
//   );
//   await fs.writeFile(
//     contactsFilePath,
//     JSON.stringify(updatedContacts, null, 2)
//   );
//   return true;
// };

// const addContact = async (contact) => {
//   const contacts = await listContacts();
//   const newContact = { ...contact, id: nanoid() };
//   contacts.push(newContact);
//   await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
//   return newContact;
// };

// const updateContact = async (contactId, data) => {
//   const contacts = await listContacts();
//   const index = contacts.findIndex((contact) => contact.id === contactId);

//   if (index !== -1) {
//     const updatedContact = { ...contacts[index], ...data, id: contactId };
//     contacts[index] = updatedContact;
//     await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
//   } else {
//     return null;
//   }
// };

// module.exports = {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// };
