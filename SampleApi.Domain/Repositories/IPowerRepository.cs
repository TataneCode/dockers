using SampleApi.Domain.Models;

namespace SampleApi.Domain.Repositories;

public interface IPowerRepository
{
    Task<IReadOnlyList<PowerModel>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PowerModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<PowerModel> CreateAsync(PowerModel power, CancellationToken cancellationToken = default);
    Task<PowerModel?> UpdateAsync(PowerModel power, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetMissingIdsAsync(
        IReadOnlyCollection<string> ids,
        CancellationToken cancellationToken = default);
}
