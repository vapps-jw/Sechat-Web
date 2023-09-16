export class TestCalass {
  something: string;

  encrypt() {
    const e2e = useE2Encryption();
    const result = e2e.encryptMessage(this.something, { key: "abc", id: 1 });
    this.something = result;
  }

  decrypt() {
    const e2e = useE2Encryption();
    const result = e2e.decryptMessage(this.something, { key: "abc", id: 1 });
    this.something = result;
  }
}
