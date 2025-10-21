import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "../users/users.model";

@Schema({ 
    timestamps: true,
    strict: true,
})
export class Review {
    @Prop({ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    })
    user!: User;
    @Prop({
        required: true,
        min: [4, 'The title should be comprised of at least 4 characters'],
    })
    title!: string;
    @Prop({
        required: true,
        default: '',
    })
    comment!: string;
    @Prop({
        required: true,
        min: [1, 'Minimum rate is 1 star'],
        max: [5, 'Maximum rate is 5 starts'],
    })
    rating!: number;
}

@Schema({
    timestamps: true,
    strict: true,
})
export class Product {
    @Prop({ required: true })
    name!: string;
    @Prop({ required: true })
    description: string;
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
    category!: string;
    @Prop({ required: true })
    brandName!: string;
    @Prop({ required: false })
    brandLogo!: string;
    @Prop({ default: 0, required: true })
    stockCount!: number;
    @Prop({ default: 0, required: true })
    reviewCount!: number;
    @Prop({ required: true })
    price!: number;
    @Prop({ required: false })
    rating!: number;
    @Prop({ required: true, default: [] })
    reviews!: Review[];
    @Prop({ required: true, default: [] })
    images!: string[];
}

@Schema({
    strict: true,
    timestamps: true,
})
export class ProductCategory {
    @Prop({
        required: true,
    })
    name!: string;
    @Prop({
        required: true,
        default: '',
    })
    description!: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product)
export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory)
