import { Request, Response } from 'express';
import { Product } from '../models/Product';

// 1. Crear producto
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, brand, stock, description } = req.body;
        const newProduct = new Product({ name, brand, stock, description });
        const savedProduct = await newProduct.save();
        return res.status(201).json(savedProduct);
    } catch (error) {
        return res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// 2. Leer todos los productos activos
export const getProducts = async (req: Request, res: Response) => {
    try {
        // Ordenamos por marca y luego por nombre
        const products = await Product.find({ isActive: true }).sort({ brand: 1, name: 1 });
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// 3. Actualizar producto (Información básica, NO stock)
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, brand, description } = req.body;

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, isActive: true },
            { $set: { name, brand, description } },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
        return res.status(200).json(updatedProduct);
    } catch (error) {
        return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

// 4. Ajustar Stock Manualmente
export const adjustStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body; // Puede ser 5 (suma) o -3 (resta)

        const product = await Product.findOne({ _id: id, isActive: true });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const newStock = product.stock + quantity;

        if (newStock < 0) {
            return res.status(400).json({ error: 'Operación denegada: El stock quedaría en negativo' });
        }

        product.stock = newStock;
        await product.save();

        return res.status(200).json({
            message: 'Stock actualizado correctamente',
            product
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al ajustar el stock' });
    }
};

// 5. Eliminar (Soft Delete)
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findOneAndUpdate(
            { _id: id, isActive: true },
            { $set: { isActive: false } },
            { new: true }
        );

        if (!deletedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
        return res.status(200).json({ message: 'Producto eliminado' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

export const createBulkProducts = async (req: Request, res: Response) => {
    try {
        const products = req.body; // Se espera un array de productos

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Se esperaba un array de productos' });
        }

        // InsertMany es mucho más rápido que hacer un .save() dentro de un loop
        const savedProducts = await Product.insertMany(products);

        return res.status(201).json({
            message: `${savedProducts.length} productos cargados exitosamente`,
            products: savedProducts
        });
    } catch (error: any) {
        console.error('Error en carga masiva:', error);
        return res.status(500).json({
            error: 'Error al procesar la carga masiva',
            details: error.message
        });
    }
};