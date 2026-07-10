interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: string;
  phone: string;
  university: string;
  image: string;
  company: { name: string; title: string };
}

export default function UserCard({ user }: { user: User }) {
  return (
    <div class="mt-8 w-full max-w-sm rounded-[12px] border border-zinc-800 bg-zinc-900 p-5 text-zinc-100">
      <div class="flex items-center gap-4">
        <img
          src={user.image}
          alt={`${user.firstName} ${user.lastName}`}
          class="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <h2 class="text-lg font-semibold">
            {user.firstName} {user.lastName}
          </h2>
          <p class="text-sm text-zinc-400">{user.email}</p>
        </div>
      </div>

      <dl class="mt-4 space-y-1 text-sm">
        <div class="flex justify-between">
          <dt class="text-zinc-500">Age</dt>
          <dd>{user.age}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-zinc-500">Gender</dt>
          <dd class="capitalize">{user.gender}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-zinc-500">Phone</dt>
          <dd>{user.phone}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-zinc-500">University</dt>
          <dd>{user.university}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-zinc-500">Company</dt>
          <dd>{user.company.name}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-zinc-500">Title</dt>
          <dd>{user.company.title}</dd>
        </div>
      </dl>
    </div>
  );
}
