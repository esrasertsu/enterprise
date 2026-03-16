using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; set; }
    public string StatusType { get; set; } = null!;
    public string OldStatus { get; set; } = null!;
    public string NewStatus { get; set; } = null!;
    public string? Note { get; set; }
    public Guid? ChangedByAdminUserId { get; set; }

    public Order Order { get; set; } = null!;
    public AdminUser? ChangedByAdminUser { get; set; }
}
