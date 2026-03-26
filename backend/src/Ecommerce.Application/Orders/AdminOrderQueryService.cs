using Ecommerce.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Orders;

public sealed class AdminOrderQueryService
{
    private readonly IAppDbContext _dbContext;

    public AdminOrderQueryService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AdminOrderListItemDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var orders = await _dbContext.Orders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.Items)
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync(cancellationToken);

        return orders
            .Select(order => new AdminOrderListItemDto(
                order.Id,
                order.OrderNumber,
                order.Customer != null
                    ? string.Join(' ', new[] { order.Customer.FirstName, order.Customer.LastName }.Where(value => !string.IsNullOrWhiteSpace(value)))
                    : "Guest customer",
                order.Customer != null
                    ? order.Customer.Email
                    : order.GuestEmail ?? "No email",
                order.Items.Count,
                order.GrandTotal,
                order.CurrencyCode,
                order.OrderStatus,
                order.PaymentStatus,
                order.FulfillmentStatus,
                order.NeedsDesignSupport,
                order.CreatedAt))
            .ToList();
    }
}