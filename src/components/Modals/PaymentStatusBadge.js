import { Badge, OverlayTrigger, Popover, Table } from "react-bootstrap";

function PaymentStatusBadge({ payment }) {
  if (!payment) return <Badge bg="secondary">Pending</Badge>;

  const paidAmount =
    payment.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const remainingAmount = payment.totalAmount - paidAmount;

  const popover = (
    <Popover>
      <Popover.Header>Payment Details</Popover.Header>
      <Popover.Body>
        <div><b>Total:</b> ₹{payment.totalAmount}</div>
        <div><b>Paid:</b> ₹{paidAmount}</div>
        <div><b>Remaining:</b> ₹{remainingAmount}</div>

        <hr />

        <Table size="sm">
          <thead>
            <tr>
              <th>Amt</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payment.transactions?.map((t, i) => (
              <tr key={i}>
                <td>₹{t.amount}</td>
                <td>{t.method}</td>
                <td>
                  {t.dateTime
                    ? new Date(t.dateTime).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }).replace(",", "")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger trigger={["hover", "focus"]} placement="right" overlay={popover}>
      <Badge
        bg={
          payment.status === "Completed"
            ? "success"
            : payment.status === "Partially Paid"
            ? "warning"
            : "secondary"
        }
      >
        {payment.status}
      </Badge>
    </OverlayTrigger>
  );
}

export default PaymentStatusBadge;
