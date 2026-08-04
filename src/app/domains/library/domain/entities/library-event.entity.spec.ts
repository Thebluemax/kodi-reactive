import { LibraryType, LibraryOperation } from './library-type.entity';
import { LibraryEventFactory, LibraryEventPhase } from './library-event.entity';

describe('LibraryEventFactory', () => {
  it('should build an event with the given type, operation and phase', () => {
    const event = LibraryEventFactory.create(
      LibraryType.Audio,
      LibraryOperation.Scan,
      LibraryEventPhase.Started
    );

    expect(event).toEqual({
      type: LibraryType.Audio,
      operation: LibraryOperation.Scan,
      phase: LibraryEventPhase.Started
    });
  });

  it('should build independent instances on each call', () => {
    const first = LibraryEventFactory.create(
      LibraryType.Video,
      LibraryOperation.Clean,
      LibraryEventPhase.Finished
    );
    const second = LibraryEventFactory.create(
      LibraryType.Video,
      LibraryOperation.Clean,
      LibraryEventPhase.Finished
    );

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});
