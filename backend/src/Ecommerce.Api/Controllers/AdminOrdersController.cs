using Ecommerce.Application.Orders;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/admin/orders")]
public sealed class AdminOrdersController : ControllerBase
{
    private readonly AdminOrderQueryService _adminOrderQueryService;

    public AdminOrdersController(AdminOrderQueryService adminOrderQueryService)
    {
        _adminOrderQueryService = adminOrderQueryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(CancellationToken cancellationToken)
    {
        var items = await _adminOrderQueryService.GetListAsync(cancellationToken);
        return Ok(items);
    }
}