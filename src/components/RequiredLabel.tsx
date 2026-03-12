import type { ReactNode } from "react";
import { Form } from "react-bootstrap";

interface RequiredLabelProps {
    children: ReactNode;
}

function RequiredLabel({ children }: RequiredLabelProps) {
    return (
        <Form.Label>
            {children} <span className="text-danger">*</span>
        </Form.Label>
    );
}

export default RequiredLabel;