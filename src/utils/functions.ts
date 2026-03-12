const globalfunctions = {
    removeEmptyFields<T extends Record<string, any>>(obj: T): Partial<T> {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) =>
                value !== "" && value !== null && value !== undefined
            )
        ) as Partial<T>;
    }
}

export default globalfunctions