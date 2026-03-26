namespace Ecommerce.Application.Abstractions.Storage;

public interface IFileStorage
{
    Task<FileStorageResult> SaveProductImageAsync(
        Guid productId,
        FileStorageUpload upload,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default);
}