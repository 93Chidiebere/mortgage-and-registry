import { Request, Response } from 'express';
import MortgageProduct from '../models/MortgageProduct';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await MortgageProduct.find({ isActive: true }).populate('lenderId', 'name logo');
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await MortgageProduct.findById(req.params.id).populate('lenderId', 'name logo');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
