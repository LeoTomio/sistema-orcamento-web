import { Pagination } from "react-bootstrap";

interface Props {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    itemPerPage: number
}

export default function PaginationComponent({ currentPage, totalItems, onPageChange, itemPerPage }: Props) {

    const totalPages = Math.ceil(totalItems / itemPerPage);

    if (totalPages <= 1) return null;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => onPageChange(i)}
            >
                {i}
            </Pagination.Item>
        );
    }

    return (
        <Pagination className="custom-pagination justify-content-center mt-3">

            <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            />

            {pages}

            <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            />
        </Pagination>
    );
}
