using Ecommerce.Application.QuoteRequests;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/admin/quote-requests")]
public sealed class AdminQuoteRequestsController : ControllerBase
{
    private readonly AdminQuoteRequestService _adminQuoteRequestService;

    public AdminQuoteRequestsController(AdminQuoteRequestService adminQuoteRequestService)
    {
        _adminQuoteRequestService = adminQuoteRequestService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(CancellationToken cancellationToken)
    {
        var items = await _adminQuoteRequestService.GetAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await _adminQuoteRequestService.GetByIdAsync(id, cancellationToken);

        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}