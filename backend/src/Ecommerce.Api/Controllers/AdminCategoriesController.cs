using Ecommerce.Application.Categories;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/admin/categories")]
public sealed class AdminCategoriesController : ControllerBase
{
    private readonly AdminCategoryQueryService _adminCategoryQueryService;
    private readonly AdminCategoryService _adminCategoryService;
    private readonly AdminCategoryImageService _adminCategoryImageService;

    public AdminCategoriesController(
        AdminCategoryQueryService adminCategoryQueryService,
        AdminCategoryService adminCategoryService,
        AdminCategoryImageService adminCategoryImageService)
    {
        _adminCategoryQueryService = adminCategoryQueryService;
        _adminCategoryService = adminCategoryService;
        _adminCategoryImageService = adminCategoryImageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(CancellationToken cancellationToken)
    {
        var items = await _adminCategoryQueryService.GetListAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await _adminCategoryQueryService.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] UpsertAdminCategoryCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var id = await _adminCategoryService.CreateAsync(command, cancellationToken);
            return CreatedAtAction(nameof(GetByIdAsync), new { id }, new { id });
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
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpsertAdminCategoryCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _adminCategoryService.UpdateAsync(id, command, cancellationToken);
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
        try
        {
            var deleted = await _adminCategoryService.DeleteAsync(id, cancellationToken);
            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPost("{id:guid}/image")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadImageAsync(Guid id, [FromForm] IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return Problem(title: "Image file is required.", statusCode: StatusCodes.Status400BadRequest);
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return Problem(title: "Only image uploads are supported.", statusCode: StatusCodes.Status400BadRequest);
        }

        try
        {
            await using var stream = file.OpenReadStream();
            var image = await _adminCategoryImageService.UploadAsync(
                id,
                new UploadAdminCategoryImageCommand(),
                new Ecommerce.Application.Abstractions.Storage.FileStorageUpload
                {
                    OriginalFileName = file.FileName,
                    ContentType = file.ContentType,
                    Content = stream,
                    Length = file.Length,
                },
                cancellationToken);

            return Ok(image);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpDelete("{id:guid}/image")]
    public async Task<IActionResult> DeleteImageAsync(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _adminCategoryImageService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}