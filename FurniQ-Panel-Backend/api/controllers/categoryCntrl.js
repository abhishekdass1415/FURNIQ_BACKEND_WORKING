import prisma from "../config/prismaConfig.js";

export const getCategories = async (req, res) => {
	try {
		const categories = await prisma.category.findMany();
		res.json(categories);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const getCategoryById = async (req, res) => {
	try {
		const category = await prisma.category.findUnique({ where: { id: req.params.id } });
		if (!category) return res.status(404).json({ error: "Category not found" });
		res.json(category);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const createCategory = async (req, res) => {
	try {
		const newCategory = await prisma.category.create({ data: req.body });
		res.status(201).json(newCategory);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const updateCategory = async (req, res) => {
	try {
		const updatedCategory = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
		res.json(updatedCategory);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const deleteCategory = async (req, res) => {
	try {
		await prisma.category.delete({ where: { id: req.params.id } });
		res.json({ message: "Category deleted" });
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};
