export interface Registry<EntryType> {
    add(entry: EntryType): EntryType;
    entry(key: string): EntryType | null;
    keys(): Iterable<string>;
}
