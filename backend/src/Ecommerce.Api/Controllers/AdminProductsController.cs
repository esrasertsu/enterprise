using Ecommerce.Application.Products;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/admin/products")]
public sealed class AdminProductsController : ControllerBase
{
    private readonly AdminProductService _adminProductService;
    private readonly AdminProductImageService _adminProductImageService;

    public AdminProductsController(
        AdminProductService adminProductService,
        AdminProductImageService adminProductImageService)
    {
        _adminProductService = adminProductService;
        _adminProductImageService = adminProductImageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(CancellationToken cancellationToken)
    {
        var items = await _adminProductService.GetListAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await _adminProductService.GetByIdAsync(id, cancellationToken);

        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] UpsertAdminProductCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var id = await _adminProductService.CreateAsync(command, cancellationToken);
            return Created($"/api/admin/products/{id}", new { id });
        }
        catch (ValidationException exception)
        {
            return ValidationProblem(new ValidationProblemDetails(exception.Errors
                .GroupBy(error => error.PropertyName)
                .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())));
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpsertAdminProductCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _adminProductService.UpdateAsync(id, command, cancellationToken);
            return updated ? NoContent() : NotFound();
        }
        catch (ValidationException exception)
        {
            return ValidationProblem(new ValidationProblemDetails(exception.Errors
                .GroupBy(error => error.PropertyName)
                .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())));
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _adminProductService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/images")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadImageAsync(
        Guid id,
        [FromForm] IFormFile? file,
        [FromForm] string? altText,
        [FromForm] bool isMain,
        [FromForm] int? sortOrder,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return Problem(title: "Image file is required.", statusCode: StatusCodes.Status400BadRequest);
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return Problem(title: "Only image uploads are supported.", statusCode: StatusCodes.Status400BadRequest);
        }

        await using var stream = file.OpenReadStream();
        var image = await _adminProductImageService.UploadAsync(
            id,
            new UploadAdminProductImageCommand
            {
                AltText = altText,
                IsMain = isMain,
                SortOrder = sortOrder,
            },
            new Application.Abstractions.Storage.FileStorageUpload
            {
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                Content = stream,
                Length = file.Length,
            },
            cancellationToken);

        return Created($"/api/admin/products/{id}/images/{image.Id}", image);
    }

    [HttpPatch("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> UpdateImageAsync(
        Guid id,
        Guid imageId,
        [FromBody] UpdateAdminProductImageCommand command,
        CancellationToken cancellationToken)
    {
        var image = await _adminProductImageService.UpdateAsync(id, imageId, command, cancellationToken);
        return image is null ? NotFound() : Ok(image);
    }

    [HttpPost("{id:guid}/images/reorder")]
    public async Task<IActionResult> ReorderImagesAsync(
        Guid id,
        [FromBody] ReorderAdminProductImagesCommand command,
        CancellationToken cancellationToken)
    {
        try
        {
            var images = await _adminProductImageService.ReorderAsync(id, command, cancellationToken);
            return images is null ? NotFound() : Ok(images);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPost("{id:guid}/images/{imageId:guid}/set-main")]
    public async Task<IActionResult> SetMainImageAsync(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        var image = await _adminProductImageService.SetMainAsync(id, imageId, cancellationToken);
        return image is null ? NotFound() : Ok(image);
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteImageAsync(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        var deleted = await _adminProductImageService.DeleteAsync(id, imageId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}