export interface Category {
    id: number,
    name: string,
    parent_id: number,
    children: Category[]
}