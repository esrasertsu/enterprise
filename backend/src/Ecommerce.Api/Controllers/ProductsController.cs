using Ecommerce.Application.Products;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController : ControllerBase
{
    private readonly PublicProductQueryService _publicProductQueryService;

    public ProductsController(PublicProductQueryService publicProductQueryService)
    {
        _publicProductQueryService = publicProductQueryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(
        [FromQuery] string? languageCode,
        [FromQuery] string? categorySlug,
        CancellationToken cancellationToken)
    {
        var items = await _publicProductQueryService.GetListAsync(languageCode, categorySlug, cancellationToken);
        return Ok(items);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlugAsync(
        string slug,
        [FromQuery] string? languageCode,
        CancellationToken cancellationToken)
    {
        var item = await _publicProductQueryService.GetBySlugAsync(slug, languageCode, cancellationToken);

        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}