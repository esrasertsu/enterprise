using Ecommerce.Application.Categories;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly PublicCategoryQueryService _publicCategoryQueryService;

    public CategoriesController(PublicCategoryQueryService publicCategoryQueryService)
    {
        _publicCategoryQueryService = publicCategoryQueryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync([FromQuery] string? languageCode, CancellationToken cancellationToken)
    {
        var items = await _publicCategoryQueryService.GetTreeAsync(languageCode, cancellationToken);
        return Ok(items);
    }
}