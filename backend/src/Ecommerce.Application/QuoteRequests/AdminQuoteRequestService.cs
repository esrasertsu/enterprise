using Ecommerce.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.QuoteRequests;

public sealed class AdminQuoteRequestService
{
    private readonly IAppDbContext _dbContext;

    public AdminQuoteRequestService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<QuoteRequestListItemDto>> GetAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.QuoteRequests
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new QuoteRequestListItemDto(
                x.Id,
                x.FullName,
                x.Email,
                x.CompanyName,
                x.ProductName,
                x.Quantity,
                x.Status,
                x.CreatedAt,
                x.AdminNotificationSentAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<QuoteRequestDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.QuoteRequests
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new QuoteRequestDetailDto(
                x.Id,
                x.FullName,
                x.Email,
                x.Phone,
                x.CompanyName,
                x.ProductName,
                x.Quantity,
                x.Notes,
                x.Status,
                x.CreatedAt,
                x.UpdatedAt,
                x.AdminNotificationSentAt))
            .FirstOrDefaultAsync(cancellationToken);
    }
}