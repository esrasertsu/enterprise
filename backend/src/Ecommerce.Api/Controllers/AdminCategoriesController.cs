using Ecommerce.Application.Categories;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/admin/categories")]
public sealed class AdminCategoriesController : ControllerBase
{
    private readonly AdminCategoryQueryService _adminCategoryQueryService;

    public AdminCategoriesController(AdminCategoryQueryService adminCategoryQueryService)
    {
        _adminCategoryQueryService = adminCategoryQueryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(CancellationToken cancellationToken)
    {
        var items = await _adminCategoryQueryService.GetListAsync(cancellationToken);
        return Ok(items);
    }
}