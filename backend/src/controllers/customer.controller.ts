import { Request, Response } from 'express';
import { Customer, ICustomer } from '../models/Customer';
import { SortOrder } from 'mongoose';

interface CustomerQuery {
  search?: string;
  sortBy?: keyof ICustomer;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req: Request<{}, {}, {}, CustomerQuery>, res: Response) => {
  try {
    const {
      search,
      sortBy = 'name',
      order = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query: Record<string, any> = { active: true };

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Validate sortBy field
    const validSortFields: (keyof ICustomer)[] = ['name', 'email', 'phone', 'createdAt', 'totalPurchases'];
    const finalSortBy = validSortFields.includes(sortBy as keyof ICustomer) ? sortBy : 'name';

    const sortOptions: { [key: string]: SortOrder } = {
      [finalSortBy]: order === 'desc' ? -1 : 1
    };

    const customers = await Customer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      count: customers.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      data: customers
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer purchase history
// @route   GET /api/customers/:id/purchases
// @access  Private
export const getCustomerPurchases = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const populatedCustomer = await customer.populate({
      path: 'purchases',
      options: {
        sort: { createdAt: -1 },
        skip,
        limit: Number(limit)
      },
      populate: {
        path: 'items.product',
        select: 'name price'
      }
    });

    const purchases = populatedCustomer.get('purchases') || [];

    res.json({
      success: true,
      count: purchases.length,
      total: purchases.length,
      pages: Math.ceil(purchases.length / Number(limit)),
      data: purchases
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 