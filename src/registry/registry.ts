export interface Registry<EntryType> {
    add(entry: EntryType): void;
    entry(key: string): EntryType | null;
    keys(): Iterable<string>;
}
