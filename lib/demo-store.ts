import bcrypt from "bcryptjs";

type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  password?: string | null;
  role: string;
  emailVerified?: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionRecord = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type TranscriptRecord = {
  id: string;
  text: string;
  userId: string;
  fileName?: string | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

function createId() {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function selectFields<T extends Record<string, any>>(data: T, select?: Record<string, any>): T | Record<string, any> {
  if (!select) {
    return data;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(select)) {
    if (value === true && key in data) {
      result[key] = data[key];
    }
  }

  return result;
}

export function createDemoDb() {
  const users = new Map<string, UserRecord>();
  const sessions = new Map<string, SessionRecord>();
  const transcripts = new Map<string, TranscriptRecord>();

  const findUniqueUser = async ({ where, select }: { where?: Record<string, any>; select?: Record<string, any> }) => {
    if (!where) {
      return null;
    }

    const entries = Array.from(users.values());
    const match = entries.find((user) => {
      if (where.email && user.email === where.email) return true;
      if (where.id && user.id === where.id) return true;
      return false;
    });

    if (!match) {
      return null;
    }

    return selectFields(match, select);
  };

  const adminPasswordHash = bcrypt.hashSync("admin123", 12);

  users.set("demo-admin", {
    id: "demo-admin",
    email: "admin@tracelog.com",
    name: "Admin User",
    password: adminPasswordHash,
    role: "ADMIN",
    emailVerified: true,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  users.set("demo-user", {
    id: "demo-user",
    email: "user@tracelog.com",
    name: "Sample User",
    password: bcrypt.hashSync("user123", 12),
    role: "USER",
    emailVerified: true,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  transcripts.set("demo-transcript", {
    id: "demo-transcript",
    text: "Demo transcript from local launch mode. Upload a real audio file to replace this sample once Gemini is configured.",
    userId: "demo-admin",
    fileName: "welcome-demo.mp3",
    duration: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    user: {
      findUnique: findUniqueUser,
      create: async ({ data, select }: { data: Record<string, any>; select?: Record<string, any> }) => {
        const id = data.id || createId();
        const record: UserRecord = {
          id,
          email: data.email,
          name: data.name ?? null,
          password: data.password ?? null,
          role: data.role ?? "USER",
          emailVerified: data.emailVerified ?? false,
          image: data.image ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        users.set(id, record);
        return selectFields(record, select);
      },
      update: async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const existing = await findUniqueUser({ where });
        if (!existing) {
          throw new Error("User not found");
        }

        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        users.set(existing.id, updated as UserRecord);
        return updated;
      },
    },
    session: {
      findUnique: async ({ where, select }: { where: Record<string, any>; select?: Record<string, any> }) => {
        const session = Array.from(sessions.values()).find((item) =>
          (where.token && item.token === where.token) || (where.id && item.id === where.id),
        );
        return session ? selectFields(session, select) : null;
      },
      create: async ({ data }: { data: Record<string, any> }) => {
        const record: SessionRecord = {
          id: data.id || createId(),
          userId: data.userId,
          token: data.token,
          expiresAt: data.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        sessions.set(record.id, record);
        return record;
      },
      deleteMany: async ({ where = {} }: { where?: Record<string, any> }) => {
        let count = 0;
        for (const [id, session] of sessions) {
          if ((!where.userId || session.userId === where.userId) && (!where.token || session.token === where.token)) {
            sessions.delete(id);
            count += 1;
          }
        }
        return { count };
      },
    },
    transcript: {
      create: async ({ data }: { data: Record<string, any> }) => {
        const record: TranscriptRecord = {
          id: data.id || createId(),
          text: data.text,
          userId: data.userId,
          fileName: data.fileName ?? null,
          duration: data.duration ?? 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        transcripts.set(record.id, record);
        return record;
      },
      findMany: async ({ orderBy, select }: { orderBy?: Record<string, any>; select?: Record<string, any> }) => {
        const list = Array.from(transcripts.values()).sort((a, b) => {
          const direction = orderBy?.createdAt === "desc" ? -1 : 1;
          return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
        });

        return list.map((transcript) => {
          const user = users.get(transcript.userId);
          const base = {
            id: transcript.id,
            text: transcript.text,
            fileName: transcript.fileName,
            createdAt: transcript.createdAt.toISOString(),
          };

          if (select?.user) {
            const projectedUser = select.user.select
              ? selectFields(
                  {
                    email: user?.email ?? "",
                    name: user?.name ?? null,
                  },
                  select.user.select,
                )
              : {
                  email: user?.email ?? "",
                  name: user?.name ?? null,
                };

            return { ...base, user: projectedUser };
          }

          return base;
        });
      },
      findUnique: async ({ where, select }: { where?: Record<string, any>; select?: Record<string, any> }) => {
        if (!where) {
          return null;
        }

        const transcript = Array.from(transcripts.values()).find((item) => item.id === where.id);
        if (!transcript) {
          return null;
        }

        return selectFields(
          {
            id: transcript.id,
            text: transcript.text,
            fileName: transcript.fileName,
            createdAt: transcript.createdAt.toISOString(),
          },
          select,
        );
      },
      delete: async ({ where }: { where: Record<string, any> }) => {
        transcripts.delete(where.id);
        return { id: where.id };
      },
    },
    $disconnect: async () => {},
  };
}
