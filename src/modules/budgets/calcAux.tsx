import type { Material } from "../materials/types";

export function calcFactor(calc_type: string, width: number, height: number) {
    switch (calc_type) {
        case "AREA":
            return width * height;           

        case "PERIMETER":
            return (width + height) * 2;

        case "WIDTH":
            return width;

        case "HEIGHT":
            return height;

        case "FIXED":
            
        default:
            return 1;
    }
}
export function calculateQuoteItem(item: any, product: any, materialsMap: Map<string, Material>) {
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
        width: item.width ?? 1,
        height: item.height ?? 1,
        quantity: item.quantity,
        materials: calcMaterials,
        subtotal: calcMaterials.reduce((s: number, m: any) => s + m.total, 0),
    };
}