import type { Material } from "../materials/types";

export function calcFactor(calc_type: string, width?: number, height?: number) {
    switch (calc_type) {
        case "AREA":
            if (width == null || height == null) throw new Error("Necessário altura e largura");
            return width * height;

        case "PERIMETER":
            if (width == null || height == null) throw new Error("Necessário altura e largura");
            return (width + height) * 2;

        case "WIDTH":
            if (width == null) throw new Error("Necessário largura");
            return width;

        case "HEIGHT":
            if (height == null) throw new Error("Necessário altura");
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
        return null;
    }

    if (needsHeight && item.height == null) {
        return null;
    }
}


export function calculateQuoteItem(
    item: any,
    product: any,
    materialsMap: Map<string, Material>
) {

    validateItem(item, product);

    const calcMaterials = product.materials.map((pm: any) => {

        const mat = materialsMap.get(pm.materialId);

        const factor = Number(
            calcFactor(
                pm.calc_type,
                Number(item.width),
                Number(item.height)
            )
        );

        const qty =
            Number(pm.quantity || 0)
            * factor
            * Number(item.quantity || 0);

        const unitPrice =
            Number(mat?.price || 0);

        return {
            materialId: pm.materialId,
            materialName: mat?.name,
            unit: mat?.unit ?? "un",
            quantity: Number(qty.toFixed(2)),
            unitPrice,
            total: Number((qty * unitPrice).toFixed(2)),
        };
    });

    return {
        productName: product.name,
        width: Number(item.width ?? 0),
        height: Number(item.height ?? 0),
        quantity: Number(item.quantity ?? 0),
        materials: calcMaterials,
        subtotal: calcMaterials.reduce(
            (s: number, m: any) => s + m.total,
            0
        ),
    };
}