using System.Text.RegularExpressions;
using Ecommerce.Application.Abstractions.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Ecommerce.Infrastructure.Storage;

public sealed class LocalFileStorage : IFileStorage
{
    private static readonly Regex InvalidFileNameChars = new($"[{Regex.Escape(new string(Path.GetInvalidFileNameChars()))}]", RegexOptions.Compiled);

    private readonly IHostEnvironment _hostEnvironment;
    private readonly FileStorageOptions _options;

    public LocalFileStorage(IHostEnvironment hostEnvironment, IConfiguration configuration)
    {
        _hostEnvironment = hostEnvironment;

        var section = configuration.GetSection("FileStorage");
        _options = new FileStorageOptions
        {
            PublicBaseUrl = section["PublicBaseUrl"] ?? string.Empty,
            UploadRoot = string.IsNullOrWhiteSpace(section["UploadRoot"]) ? "wwwroot/uploads" : section["UploadRoot"]!,
        };
    }

    public async Task<FileStorageResult> SaveProductImageAsync(
        Guid productId,
        FileStorageUpload upload,
        CancellationToken cancellationToken = default)
    {
        return await SaveImageAsync(new[] { "products", productId.ToString("N") }, upload, cancellationToken);
    }

    public async Task<FileStorageResult> SaveCategoryImageAsync(
        Guid categoryId,
        FileStorageUpload upload,
        CancellationToken cancellationToken = default)
    {
        return await SaveImageAsync(new[] { "categories", categoryId.ToString("N") }, upload, cancellationToken);
    }

    public Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var relativePath = TryGetRelativePath(fileUrl);
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return Task.CompletedTask;
        }

        var fullPath = Path.Combine(_hostEnvironment.ContentRootPath, _options.UploadRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    private async Task<FileStorageResult> SaveImageAsync(
        IReadOnlyList<string> relativeSegments,
        FileStorageUpload upload,
        CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(upload.OriginalFileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = upload.ContentType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                "image/gif" => ".gif",
                _ => ".jpg",
            };
        }

        var safeExtension = InvalidFileNameChars.Replace(extension.ToLowerInvariant(), string.Empty);
        var targetDirectory = Path.Combine(_hostEnvironment.ContentRootPath, _options.UploadRoot, Path.Combine(relativeSegments.ToArray()));

        Directory.CreateDirectory(targetDirectory);

        var storedFileName = $"{Guid.NewGuid():N}{safeExtension}";
        var fullPath = Path.Combine(targetDirectory, storedFileName);

        await using (var fileStream = File.Create(fullPath))
        {
            await upload.Content.CopyToAsync(fileStream, cancellationToken);
        }

        var relativeUrlPath = $"/uploads/{string.Join('/', relativeSegments)}/{storedFileName}";
        var publicBaseUrl = _options.PublicBaseUrl.TrimEnd('/');
        var publicUrl = string.IsNullOrWhiteSpace(publicBaseUrl)
            ? relativeUrlPath
            : $"{publicBaseUrl}{relativeUrlPath}";

        return new FileStorageResult(publicUrl, storedFileName, upload.Length, upload.ContentType);
    }

    private string? TryGetRelativePath(string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
        {
            return null;
        }

        if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var absoluteUri))
        {
            var absolutePath = absoluteUri.AbsolutePath;
            return absolutePath.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase)
                ? absolutePath["/uploads/".Length..]
                : null;
        }

        return fileUrl.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase)
            ? fileUrl["/uploads/".Length..]
            : null;
    }
}