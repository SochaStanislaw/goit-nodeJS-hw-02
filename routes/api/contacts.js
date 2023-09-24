const express = require("express");
const router = express.Router();
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");
const { contactSchema } = require("../../models/validation");
const auth = require("../../middleware/auth");

// get the contact' list
router.get("/", auth, async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// get the contact by id
router.get("/:contactId", auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const contact = await getContactById(contactId);

    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

// make new contact endpoint
router.post("/", auth, async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const owner = req.user._id;

    const { error } = contactSchema.validate({ name, email, phone });

    if (error) {
      res.status(400).json({ message: "Validation error" });
      return;
    }

    const newContact = await addContact({ name, email, phone, owner });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// delete contact by id
router.delete("/:contactId", auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const success = await removeContact(contactId);

    if (success) {
      res.status(200).json({ message: "Contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

// update contact by id
router.put("/:contactId", auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { name, email, phone } = req.body;
    const { error } = contactSchema.validate({ name, email, phone });

    if (error) {
      res.status(400).json({ message: "Validation error" });
      return;
    }

    const updatedContact = await updateContact(contactId, {
      name,
      email,
      phone,
    });

    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

// Update favorites option contact by id
router.patch("/:contactId/favorite", auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { favorite } = req.body;

    if (typeof favorite !== "boolean") {
      res.status(400).json({ message: "Validation error" });
      return;
    }

    const updatedContact = await updateStatusContact(contactId, { favorite });

    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
