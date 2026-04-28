import type { Material } from "../materials/types";

export function calcFactor(calc_type: string, width?: number, height?: number) {
    switch (calc_type) {
        case "AREA":
            if (width == null || height == null) throw new Error("AREA requer width e height");
            return width * height;

        case "PERIMETER":
            if (width == null || height == null) throw new Error("PERIMETER requer width e height");
            return (width + height) * 2;

        case "WIDTH":
            if (width == null) throw new Error("WIDTH requer width");
            return width;

        case "HEIGHT":
            if (height == null) throw new Error("HEIGHT requer height");
            return height;

        case "FIXED":
        default:
            return 1;
    }
}

function validateItem(item: any, product: any) {
    const needsWidth = product.materials.some((m: any) =>
        ["WIDTH", "AREA", "PERIMETER"].includes(m.calc_type)
    );

    const needsHeight = product.materials.some((m: any) =>
        ["HEIGHT", "AREA", "PERIMETER"].includes(m.calc_type)
    );
    

    if (needsWidth && item.width == null) {
        throw new Error("Este produto exige largura");
    }

    if (needsHeight && item.height == null) {
        throw new Error("Este produto exige altura");
    }
}


export function calculateQuoteItem(item: any, product: any, materialsMap: Map<string, Material>) {

    validateItem(item, product);

    const calcMaterials = product.materials.map((pm: any) => {
        const mat = materialsMap.get(pm.materialId);

        const factor = calcFactor(pm.calc_type, item.width, item.height);
        const qty = pm.quantity * factor * item.quantity;

        return {
            materialId: pm.materialId,
            materialName: mat?.name,
            unit: mat?.unit ?? "un",
            quantity: Number(qty.toFixed(2)),
            unitPrice: Number(mat?.price ?? 0),
            total: Number((qty * (mat?.price ?? 0)).toFixed(2)),
        };
    });

    return {
        productName: product.name,
        width: item.width ?? 0,
        height: item.height ?? 0,
        quantity: item.quantity,
        materials: calcMaterials,
        subtotal: calcMaterials.reduce((s: number, m: any) => s + m.total, 0),
    };
}