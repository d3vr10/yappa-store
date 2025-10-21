import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductCategory, ProductCategorySchema, Product, ProductSchema } from "./products.models";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { UsersModule } from "../users/users.module";
import { ProductCategoriesController } from "./categories.controller";
import { ProductCategoriesService } from "./categories.service";

export const MONGOOSE_PRODUCTS_MODELS_MODULE = MongooseModule.forFeature([
    { name: Product.name, schema: ProductSchema, },
    { name: ProductCategory.name, schema: ProductCategorySchema, },
])

@Module({
    imports: [
        MONGOOSE_PRODUCTS_MODELS_MODULE,
        forwardRef(() => UsersModule),
    ],
    controllers: [
        ProductsController,
        ProductCategoriesController,
    ],
    providers: [
        ProductsService,
        ProductCategoriesService,
    ],
    exports: [
        MONGOOSE_PRODUCTS_MODELS_MODULE,
        ProductsService
    ],
})
export class ProductsModule { }