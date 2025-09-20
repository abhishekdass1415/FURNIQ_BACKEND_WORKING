import prisma from "../config/prismaConfig.js";

export const getCustomers = async (req, res) => {
	try {
		const customers = await prisma.customer.findMany();
		res.json(customers);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const getCustomerById = async (req, res) => {
	try {
		const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
		if (!customer) return res.status(404).json({ error: "Customer not found" });
		res.json(customer);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const createCustomer = async (req, res) => {
	try {
		const newCustomer = await prisma.customer.create({ data: req.body });
		res.status(201).json(newCustomer);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const updateCustomer = async (req, res) => {
	try {
		const updatedCustomer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
		res.json(updatedCustomer);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const deleteCustomer = async (req, res) => {
	try {
		await prisma.customer.delete({ where: { id: req.params.id } });
		res.json({ message: "Customer deleted" });
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};
