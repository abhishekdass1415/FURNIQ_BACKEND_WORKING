import express from "express";
import {
    getInventoryLogs,
    getInventoryLogById,
    createInventoryLog,
    updateInventoryLog,
    deleteInventoryLog
} from "../controllers/inventoryCntrl.js";

const router = express.Router();

router.get("/", getInventoryLogs);
router.get("/:id", getInventoryLogById);
router.post("/", createInventoryLog);
router.put("/:id", updateInventoryLog);
router.delete("/:id", deleteInventoryLog);

export default router;

