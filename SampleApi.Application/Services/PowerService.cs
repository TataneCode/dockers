using SampleApi.Domain.Models;
using SampleApi.Domain.Repositories;

namespace SampleApi.Application.Services;

public sealed class PowerService(IPowerRepository powerRepository) : IPowerService
{
    public Task<IReadOnlyList<PowerModel>> GetAllAsync(CancellationToken cancellationToken = default) =>
        powerRepository.GetAllAsync(cancellationToken);

    public Task<PowerModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default) =>
        powerRepository.GetByIdAsync(id, cancellationToken);

    public async Task<PowerModel> CreateAsync(PowerModel power, CancellationToken cancellationToken = default)
    {
        var powerToCreate = power with
        {
            Id = Guid.NewGuid().ToString()
        };

        return await powerRepository.CreateAsync(powerToCreate, cancellationToken);
    }

    public Task<PowerModel?> UpdateAsync(
        string id,
        PowerModel power,
        CancellationToken cancellationToken = default) =>
        powerRepository.UpdateAsync(power with { Id = id }, cancellationToken);

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default) =>
        powerRepository.DeleteAsync(id, cancellationToken);
}
