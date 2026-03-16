using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities;

public class OrderFile : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid? OrderItemId { get; set; }

    public string FileUrl { get; set; } = null!;
    public string OriginalFileName { get; set; } = null!;
    public string StoredFileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public long FileSize { get; set; }
    public FileCategory FileCategory { get; set; }

    public Order Order { get; set; } = null!;
    public OrderItem? OrderItem { get; set; }
}