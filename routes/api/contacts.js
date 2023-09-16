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

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    console.log("Received contactId:", contactId); // Dodaj ten log

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

// router.get("/:contactId", async (req, res, next) => {
//   try {
//     const contactId = req.params.contactId;
//     const contact = await getContactById(contactId);

//     if (contact) {
//       res.status(200).json(contact);
//     } else {
//       res.status(404).json({ message: "Not found xD" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { error } = contactSchema.validate({ name, email, phone });

    if (error) {
      res.status(400).json({ message: "missing required name - field" });
      return;
    }

    const newContact = await addContact({ name, email, phone });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const success = await removeContact(contactId);

    if (success) {
      res.status(200).json({ message: "contact deleted" });
    } else {
      res.status(404).json({ message: "Not found xxddd" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { name, email, phone } = req.body;
    const { error } = contactSchema.validate({ name, email, phone });

    if (error) {
      res.status(400).json({ message: "missing fields" });
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
      res.status(404).json({ message: "Not found XD" });
    }
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { favorite } = req.body;

    if (typeof favorite !== "boolean") {
      res.status(400).json({ message: "missing field favorite" });
      return;
    }

    const updatedContact = await updateStatusContact(contactId, { favorite });

    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found xDDD" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
