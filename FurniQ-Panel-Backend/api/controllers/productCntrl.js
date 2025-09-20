import prisma from "../config/prismaConfig.js";

export const getProducts = async (req, res) => {
	try {
		console.log('Fetching products...');
		const products = await prisma.product.findMany();
		console.log(`Found ${products.length} products`);
		res.json(products);
	} catch (err) {
		console.error('Error fetching products:', err);
		res.status(500).json({ 
			error: "Failed to fetch products", 
			message: err.message,
			details: process.env.NODE_ENV === 'development' ? err.stack : undefined
		});
	}
};

export const getProductById = async (req, res) => {
	try {
		const product = await prisma.product.findUnique({ where: { id: req.params.id } });
		if (!product) return res.status(404).json({ error: "Product not found" });
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const createProduct = async (req, res) => {
	try {
		console.log('Creating product with data:', req.body);
		
		// If category name is provided, find the category ID
		let categoryId = req.body.categoryId;
		if (req.body.category && !categoryId) {
			const category = await prisma.category.findFirst({ 
				where: { name: req.body.category } 
			});
			if (category) {
				categoryId = category.id;
			}
		}
		
		// If subcategory name is provided, find the subcategory ID and use it as categoryId
		if (req.body.subcategory && !categoryId) {
			const subcategory = await prisma.category.findFirst({ 
				where: { name: req.body.subcategory } 
			});
			if (subcategory) {
				categoryId = subcategory.id;
			}
		}
		
		// Prepare product data - only include valid Prisma fields
		const productData = {
			name: req.body.name,
			description: req.body.description,
			sku: req.body.sku,
			price: parseFloat(req.body.price) || 0,
			stock: parseInt(req.body.stock) || 0,
			lowStock: parseInt(req.body.lowStock) || 5,
			imageUrl: req.body.imageUrl,
			brand: req.body.brand,
			color: req.body.color,
			material: req.body.material,
			warranty: req.body.warranty,
			categoryId: categoryId
		};
		
		const newProduct = await prisma.product.create({ data: productData });
		res.status(201).json(newProduct);
	} catch (err) {
		console.error('Error creating product:', err);
		res.status(500).json({ 
			error: "Failed to create product", 
			message: err.message,
			details: process.env.NODE_ENV === 'development' ? err.stack : undefined
		});
	}
};

export const updateProduct = async (req, res) => {
	try {
		const updatedProduct = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
		res.json(updatedProduct);
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		await prisma.product.delete({ where: { id: req.params.id } });
		res.json({ message: "Product deleted" });
	} catch (err) {
		res.status(500).json({ error: "Something went wrong" });
	}
};
