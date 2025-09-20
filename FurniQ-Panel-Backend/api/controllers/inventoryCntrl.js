import prisma from "../config/prismaConfig.js";

export const getInventoryLogs = async (req, res) => {
	try {
		const logs = await prisma.inventoryLog.findMany();
		res.json(logs);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const getInventoryLogById = async (req, res) => {
	try {
		const log = await prisma.inventoryLog.findUnique({ where: { id: req.params.id } });
		if (!log) return res.status(404).json({ error: "Inventory log not found" });
		res.json(log);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const createInventoryLog = async (req, res) => {
	try {
		const newLog = await prisma.inventoryLog.create({ data: req.body });
		res.status(201).json(newLog);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const updateInventoryLog = async (req, res) => {
	try {
		const updatedLog = await prisma.inventoryLog.update({ where: { id: req.params.id }, data: req.body });
		res.json(updatedLog);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const deleteInventoryLog = async (req, res) => {
	try {
		await prisma.inventoryLog.delete({ where: { id: req.params.id } });
		res.json({ message: "Inventory log deleted" });
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};
